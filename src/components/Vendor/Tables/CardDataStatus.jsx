import { motion } from 'framer-motion';

function CardDataStatus({ title, value, change, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-6 min-h-28 flex items-center justify-between shadow-card"
    >
    <div className='flex gap-6'>
      <div>
     {icon}
      </div>
    <div>
        <p className="text-[black] text-sm md:text-base">{title}</p>
        <h2 className="text- md:text-lg font-semibold">{value}</h2>
      </div>
    </div>
      
    </motion.div>
  );
}

export default CardDataStatus;
