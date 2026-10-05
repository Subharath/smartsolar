function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-11 h-11 rounded-full animate-spin"
        style={{
          border: '3px solid #E2E8E4',
          borderTopColor: '#00B878',
          borderRightColor: '#0B5D43',
        }}
      />
      <p className="text-sm font-medium" style={{ color: '#66756F' }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
