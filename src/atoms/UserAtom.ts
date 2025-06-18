import { atom } from "recoil";

const userAtom = atom({
    key:'user',
    default: (() => {
        const user = localStorage.getItem('user');
        console.log(user,"s")
        return user ? JSON.parse(user) : null; 
    })()
});
export default userAtom;