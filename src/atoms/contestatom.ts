import { atom } from "recoil";

export interface Contest {
  _id: string;
  contesttitle: string;
  contestdesc: string;
  startTime: string;
  endTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  quesId:string[]
  userId:string[]
  createdby:string
  status: 'upcoming' | 'active' | 'ended';
}

// Default empty contest (may be adjusted based on your needs)
const defaultContest: Contest = {
  _id: '',
  userId:[],
  createdby:'',
  contesttitle: '',
  contestdesc: '',
  startTime: '',
  endTime: '',
  difficulty: 'Easy',
  participants: 0,
  status: 'upcoming',
  quesId:[],
};

const ContestSelect = atom<Contest>({
  key: 'ContestSelect',
  default: defaultContest, 
});

export default ContestSelect;
