export const Cloud = () => {
    return (
        <div>
            <div className="relative mt-60">
                <img
                    src="/online-logo.png"
                    alt="Online logo"
                    className="absolute left-[68%] top-[40%] transform -translate-x-1/2 z-10 size-80 p-7"
                />
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 1440 319"
                    className="relative"
                ><path fill="white" 
                    fill-opacity="1"
                    d="M0,192L48,165.3C96,139,192,85,288,85.3C384,85,480,139,576,
                        138.7C672,139,768,85,864,58.7C960,32,1056,32,1152,69.3C1248,
                        107,1344,181,1392,218.7L1440,256L1440,320L1392,320C1344,320,1248,
                        320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,
                        320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                    </path>
                </svg>  
            </div>
            <div className="relative bg-[#FFFF] p-10 flex flex-col text-left px-40">
                <h1 className="text-2xl font-bold m-4">
                Har du opplevd noe ugreit?
                </h1>
               <p className="mb-10 text-2xl">
                Online har et eget uavhengig organ for varslingssaker som kan hjelpe med alt. 
                Vi ønsker at alle skal ha det bra og føle seg trygge. Derfor håper vi at du tar kontakt dersom du har opplevd noe ubehagelig under fadderukene. 
                Ser du at noen andre opplever noe ubehagelig er det viktig å huske på at du også har et ansvar for å si ifra. Vi tar imot alt, 
                og om du er i tvil er det bare å sende oss en melding. Tar du kontakt med oss vil all informasjon behandles strengt konfidensielt.
                Vi kan bistå med alt fra en uformell prat til å hjelpe deg med å oppsøke profesjonell hjelp eller rådgivning.
            </p>
            <div className="flex flex-row justify-center items-center">
                 <button className="bg-[#2D5A77] text-white px-14 py-10 rounded-2xl hover:bg-[#234761] transition-colors m-7 text-2xl">
                Ta kontakt her
                </button> 
            </div>
           
            </div>
            <div>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 1440 321"
                    ><path fill="white" 
                    fill-opacity="10" 
                    d="M0,160L1440,96L1440,0L0,0Z">
                    </path>
                </svg>
            </div>
            
        </div>
    );
}