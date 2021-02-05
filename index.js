import express from "express";
import bodyParser from "body-parser";

import katanaRoutes from "./routes/katana.js";



const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use("/", katanaRoutes);



app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));
