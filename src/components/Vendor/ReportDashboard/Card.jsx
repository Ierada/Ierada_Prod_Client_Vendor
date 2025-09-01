
export default function Card({ image, value, description }) {

  return (
    <div className='p-4 bg-white rounded-lg border border-[#EFF0F6] flex items-center'>
      <img src={image} alt={description} className=' w-20 h-20' />
      <p className='text-[18px] font-satoshi font-normal text-[#171A1F] text-center flex-grow'>
        {description === 'Revenue' ? value.toLocaleString('en-IN') : value}
        {description === 'Orders' ? '+' : null} <br /> {description}
      </p>
    </div>
  );
}
