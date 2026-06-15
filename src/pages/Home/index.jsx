import Header from "../../components/Header";

const index = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="bg-image flex-1">
        <div className="bg-black opacity-75 h-full flex items-center">
          <div className="flex-1 flex flex-col justify-center px-5 md:px-8">
            <div className="mb-6">
              <h1 className="text-white text-5xl md:text-7xl font-extrabold  tracking-tight">
                Tritek Academy
              </h1>
            </div>
            <div className="mb-10"></div>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export default index;
