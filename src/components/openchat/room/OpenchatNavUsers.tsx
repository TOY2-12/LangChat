import * as React from 'react';
import { motion } from 'framer-motion';
import OpenchatNavUserItem from './OpenchatNavUserItem';
import { User } from '../../../types/User';
import OpenchatNavInvite from './OpenchatNavInvite';

// const variants = {
//   open: {
//     transition: { staggerChildren: 0.07, delayChildren: 0.2 },
//   },
//   closed: {
//     transition: { staggerChildren: 0.05, staggerDirection: -1 },
//   },
// };

interface OpenchatNavUsersProps {
  users: User[];
  handleOpen: () => void;
}

function OpenchatNavUsers({ users, handleOpen }: OpenchatNavUsersProps) {
  return (
    <motion.ul>
      {users.map((user) => (
        <OpenchatNavUserItem key={user.id} user={user} />
      ))}
      <OpenchatNavInvite handleOpen={handleOpen} />
    </motion.ul>
  );
}
export default OpenchatNavUsers;
