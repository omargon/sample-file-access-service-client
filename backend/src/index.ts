import { app } from './app';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(port, () => {
  console.log(`Sample File Access Service running on port ${port}`);
});
