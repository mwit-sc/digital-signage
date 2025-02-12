import Image from "next/image";
const color = "orange";
const daycolor = "green-600";
export default function Home() {
  return (
    <div className="m-5 bg-white bg-opacity-25 w-[calc(100vw-2.5rem)] h-[calc(100vh-2.5rem)] flex justify-center items-center rounded-xl">
      <div className="text-black">
        <div className={`p-5 rounded-lg w-[calc(100vw-7.5rem)] bg-${daycolor} flex items-center mx-auto`}>
          <div className="text-2xl leading-[15px]">
            <p className="font-bold">รางงานคุณภาพอากาศ</p><br></br>
            Air Quality Index <br />
          </div>
            <div className="ml-auto text-4xl font-bold">
            วันพุธที่ 12 กุมภาพันธ์ 2568 เวลา 20.00 น.
            </div>
          <p></p>
        </div>
        <div className={`p-5 flex items-center justify-center mt-10`}>
          <div className="text-2xl leading-[15px] rounded-lg bg-orange-500 w-[calc(50vw-5rem)] h-[calc(50vh-2.5rem)] text-center p-5">
            <p className="text-[50px] mt-5">PM 2.5</p><br></br>
            <p className="font-bold text-[50px] mt-10">000.0 <small>µg/m³</small></p><br></br>
            <p className="mt-5">มีผลกระทบต่อผู้ป่วยหรือร่างกายอ่อนแอ</p>
          </div>
          <div className="text-2xl leading-[15px] rounded-lg bg-red-500 w-[calc(50vw-5rem)] h-[calc(50vh-2.5rem)] p-5 ml-5">
            <p className="font-bold">รางงานคุณภาพอากาศ</p><br></br>
            Air Quality Index <br />
          </div>
          <p></p>
        </div>
      </div>
    </div>

  );
}
