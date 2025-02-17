// app/loading.tsx

const Loading = () => {
  return (
    <div className="flex justify-center items-center gap-6 mt-10">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-2xl font-semibold">Loading</p>
    </div>
  );
};

export default Loading;
