export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}
