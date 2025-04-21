const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
};

export default LoadingSpinner;
