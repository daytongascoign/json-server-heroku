import express from 'express';

import { getCollection, getMyNft, getTokenList } from '../controllers/katana.js';

const router = express.Router();

router.get('/collection', getCollection);

router.get('/null-card/:id', getMyNft);

router.get('/hecochain', getTokenList);


export default router;