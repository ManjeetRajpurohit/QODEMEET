import express from 'express'
import {
  AddQuestion,
  DeleteQuestion,
  singleQuestion,
  ALLquestions
} from '../controllers/QuestionController.js';

const questionRouter = express.Router();

questionRouter.post('/add', AddQuestion);

questionRouter.post('/remove/:id', DeleteQuestion);

questionRouter.get('/', ALLquestions);

questionRouter.get('/:id', singleQuestion);

export default questionRouter;