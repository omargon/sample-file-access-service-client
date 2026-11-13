import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { User, Sample, FileRecord, QCStatus } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'user-1', name: 'User 1', apiKey: 'user1-key' },
  { id: 'user-2', name: 'User 2', apiKey: 'user2-key' },
  { id: 'pipeline-user', name: 'QC Pipeline', apiKey: 'pipeline-key', isPipeline: true },
];

interface UserRow {
  id: string;
  name: string;
  api_key: string;
  is_pipeline: number;
}

interface SampleRow {
  id: string;
  name: string;
  owner_id: string;
}

interface FileRow {
  id: string;
  name: string;
  sample_id: string;
  qc_status: string;
}

interface AccessRow {
  user_id: string;
}

interface FileIdRow {
  id: string;
}

export class SQLiteStore {
  private db: DatabaseSync;

  constructor(dbPath: string = process.env.DB_PATH || 'data/service.db') {
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(dbPath);
    this.init();
  }

  private init(): void {
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        api_key TEXT NOT NULL UNIQUE,
        is_pipeline INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS samples (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS sample_files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sample_id TEXT NOT NULL REFERENCES samples(id),
        qc_status TEXT NOT NULL CHECK(qc_status IN ('pending', 'passed', 'failed'))
      );

      CREATE TABLE IF NOT EXISTS sample_access (
        sample_id TEXT NOT NULL REFERENCES samples(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        PRIMARY KEY (sample_id, user_id)
      );
    `);

    this.seedUsers();
  }

  private seedUsers(): void {
    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO users (id, name, api_key, is_pipeline)
      VALUES (?, ?, ?, ?)
    `);

    for (const u of INITIAL_USERS) {
      insertStmt.run(u.id, u.name, u.apiKey, u.isPipeline ? 1 : 0);
    }
  }

  public reset(): void {
    this.db.exec(`
      DELETE FROM sample_access;
      DELETE FROM sample_files;
      DELETE FROM samples;
    `);
    this.seedUsers();
  }

  public getUser(id: string): User | undefined {
    const stmt = this.db.prepare('SELECT id, name, api_key, is_pipeline FROM users WHERE id = ?');
    const row = stmt.get(id) as unknown as UserRow | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      apiKey: row.api_key,
      isPipeline: row.is_pipeline === 1,
    };
  }

  public getUserByApiKey(apiKey: string): User | undefined {
    const stmt = this.db.prepare('SELECT id, name, api_key, is_pipeline FROM users WHERE api_key = ?');
    const row = stmt.get(apiKey) as unknown as UserRow | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      apiKey: row.api_key,
      isPipeline: row.is_pipeline === 1,
    };
  }

  public getSample(id: string): Sample | undefined {
    const sampleStmt = this.db.prepare('SELECT id, name, owner_id FROM samples WHERE id = ?');
    const sampleRow = sampleStmt.get(id) as unknown as SampleRow | undefined;
    if (!sampleRow) return undefined;

    const filesStmt = this.db.prepare('SELECT id FROM sample_files WHERE sample_id = ?');
    const fileRows = filesStmt.all(id) as unknown as FileIdRow[];

    const accessStmt = this.db.prepare('SELECT user_id FROM sample_access WHERE sample_id = ?');
    const accessRows = accessStmt.all(id) as unknown as AccessRow[];

    return {
      id: sampleRow.id,
      name: sampleRow.name,
      ownerId: sampleRow.owner_id,
      fileIds: fileRows.map((f) => f.id),
      grantedUserIds: new Set(accessRows.map((a) => a.user_id)),
    };
  }

  public saveSample(sample: Sample): void {
    const insertSampleStmt = this.db.prepare(`
      INSERT INTO samples (id, name, owner_id)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, owner_id = excluded.owner_id
    `);
    insertSampleStmt.run(sample.id, sample.name, sample.ownerId);

    const insertAccessStmt = this.db.prepare(`
      INSERT OR IGNORE INTO sample_access (sample_id, user_id)
      VALUES (?, ?)
    `);
    for (const userId of sample.grantedUserIds) {
      insertAccessStmt.run(sample.id, userId);
    }
  }

  public getFile(id: string): FileRecord | undefined {
    const stmt = this.db.prepare('SELECT id, name, sample_id, qc_status FROM sample_files WHERE id = ?');
    const row = stmt.get(id) as unknown as FileRow | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      sampleId: row.sample_id,
      qcStatus: row.qc_status as QCStatus,
    };
  }

  public saveFile(file: FileRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO sample_files (id, name, sample_id, qc_status)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, qc_status = excluded.qc_status
    `);
    stmt.run(file.id, file.name, file.sampleId, file.qcStatus);
  }

  public listUsers(): User[] {
    const stmt = this.db.prepare('SELECT id, name, api_key, is_pipeline FROM users');
    const rows = stmt.all() as unknown as UserRow[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      apiKey: row.api_key,
      isPipeline: row.is_pipeline === 1,
    }));
  }

  public listSamples(): Array<Sample & { ownerName: string; files: FileRecord[] }> {
    const stmt = this.db.prepare(`
      SELECT s.id, s.name, s.owner_id, u.name as owner_name
      FROM samples s
      JOIN users u ON s.owner_id = u.id
      ORDER BY s.id DESC
    `);
    const sampleRows = stmt.all() as unknown as Array<SampleRow & { owner_name: string }>;

    return sampleRows.map((sampleRow) => {
      const filesStmt = this.db.prepare('SELECT id, name, sample_id, qc_status FROM sample_files WHERE sample_id = ?');
      const fileRows = filesStmt.all(sampleRow.id) as unknown as FileRow[];

      const accessStmt = this.db.prepare('SELECT user_id FROM sample_access WHERE sample_id = ?');
      const accessRows = accessStmt.all(sampleRow.id) as unknown as AccessRow[];

      return {
        id: sampleRow.id,
        name: sampleRow.name,
        ownerId: sampleRow.owner_id,
        ownerName: sampleRow.owner_name,
        fileIds: fileRows.map((f) => f.id),
        grantedUserIds: new Set(accessRows.map((a) => a.user_id)),
        files: fileRows.map((f) => ({
          id: f.id,
          name: f.name,
          sampleId: f.sample_id,
          qcStatus: f.qc_status as QCStatus,
        })),
      };
    });
  }

  public getFilesForSample(sampleId: string): FileRecord[] {
    const stmt = this.db.prepare('SELECT id, name, sample_id, qc_status FROM sample_files WHERE sample_id = ?');
    const rows = stmt.all(sampleId) as unknown as FileRow[];
    return rows.map((f) => ({
      id: f.id,
      name: f.name,
      sampleId: f.sample_id,
      qcStatus: f.qc_status as QCStatus,
    }));
  }

  public seedInitialData(): void {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM samples');
    const row = countStmt.get() as unknown as { count: number };
    if (row && row.count > 0) {
      return;
    }
    this.forceSeedData();
  }

  public forceSeedData(): void {
    this.reset();

    // Sample 1: TNBC WGS (Owner: user-1, Collaborator: user-2)
    const sample1Id = 'sample_tnbc_cohort_01';
    this.saveSample({
      id: sample1Id,
      name: 'Triple-Negative Breast Cancer WGS Cohort #01',
      ownerId: 'user-1',
      fileIds: ['file_tnbc_tumor_wgs', 'file_tnbc_germline_normal', 'file_tnbc_somatic_vcf'],
      grantedUserIds: new Set(['user-2']),
    });
    this.saveFile({ id: 'file_tnbc_tumor_wgs', name: 'tnbc_tumor_wgs.bam', sampleId: sample1Id, qcStatus: 'passed' });
    this.saveFile({ id: 'file_tnbc_germline_normal', name: 'tnbc_germline_normal.bam', sampleId: sample1Id, qcStatus: 'passed' });
    this.saveFile({ id: 'file_tnbc_somatic_vcf', name: 'tnbc_somatic_variants.vcf.gz', sampleId: sample1Id, qcStatus: 'pending' });

    // Sample 2: Glioblastoma scRNA-Seq (Owner: user-1, Private)
    const sample2Id = 'sample_gbm_scrna_panel';
    this.saveSample({
      id: sample2Id,
      name: 'Glioblastoma Multiforme Single-Cell RNA-Seq',
      ownerId: 'user-1',
      fileIds: ['file_gbm_raw_fastq', 'file_gbm_seurat_metrics', 'file_gbm_qc_report'],
      grantedUserIds: new Set(),
    });
    this.saveFile({ id: 'file_gbm_raw_fastq', name: 'gbm_scrnaseq_raw.fastq.gz', sampleId: sample2Id, qcStatus: 'passed' });
    this.saveFile({ id: 'file_gbm_seurat_metrics', name: 'gbm_seurat_cluster_metrics.tsv', sampleId: sample2Id, qcStatus: 'pending' });
    this.saveFile({ id: 'file_gbm_qc_report', name: 'gbm_alignment_qc_report.pdf', sampleId: sample2Id, qcStatus: 'failed' });

    // Sample 3: Long-Read PacBio HiFi (Owner: user-2, Private)
    const sample3Id = 'sample_pacbio_hifi_survey';
    this.saveSample({
      id: sample3Id,
      name: 'Long-Read PacBio HiFi Metagenomic Survey',
      ownerId: 'user-2',
      fileIds: ['file_pacbio_reads', 'file_hifiasm_contigs'],
      grantedUserIds: new Set(),
    });
    this.saveFile({ id: 'file_pacbio_reads', name: 'pacbio_hifi_reads.bam', sampleId: sample3Id, qcStatus: 'passed' });
    this.saveFile({ id: 'file_hifiasm_contigs', name: 'hifiasm_assembly_contigs.fasta', sampleId: sample3Id, qcStatus: 'pending' });

    // Sample 4: CRISPR Screening (Owner: user-1, Collaborator: user-2)
    const sample4Id = 'sample_crispr_screening';
    this.saveSample({
      id: sample4Id,
      name: 'CRISPR-Cas9 Off-Target Sequencing Screening',
      ownerId: 'user-1',
      fileIds: ['file_crispr_alignment', 'file_crispr_metrics'],
      grantedUserIds: new Set(['user-2']),
    });
    this.saveFile({ id: 'file_crispr_alignment', name: 'crispr_guide_alignment.bam', sampleId: sample4Id, qcStatus: 'passed' });
    this.saveFile({ id: 'file_crispr_metrics', name: 'offtarget_cleavage_metrics.json', sampleId: sample4Id, qcStatus: 'passed' });
  }
}

export const store = new SQLiteStore();
