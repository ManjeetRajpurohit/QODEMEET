import express from 'express'
import userAuth from '../middleware/userAuth.js';
import {
  AddQuestion,
  DeleteQuestion,
  singleQuestion,
  ALLquestions
} from '../controllers/QuestionController.js';

const questionRouter = express.Router();

questionRouter.post('/add',userAuth, AddQuestion);

questionRouter.post('/remove/:id', userAuth,DeleteQuestion);

questionRouter.get('/',userAuth, ALLquestions);

questionRouter.get('/:id',userAuth, singleQuestion);

export default questionRouter;