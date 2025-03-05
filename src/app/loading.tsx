export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin dark:border-green-500"></div>
      <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Loading...
      </p>
    </div>
  );
}
