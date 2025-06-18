import { atom } from "recoil";

export interface Question {
  _id: string;
  contestId: string;
  title: string;
  desc: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  memoryLimit: number;
  points: number;
  input: string;
  expectedOutput: string;
}

const defaultQuestion: Question = {
  _id: '',
  contestId: '',
  title: '',
  desc: '',
  difficulty: 'Easy', 
  timeLimit: 1, 
  memoryLimit: 1,
  points: 0,
  input: '',
  expectedOutput: '',
};

const QuestionSelectAtom = atom<Question>({
  key: 'QuestionSelectAtom',
  default: defaultQuestion, 
});

export default QuestionSelectAtom;
