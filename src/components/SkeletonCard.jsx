import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster shimmer" />
      <div className="skeleton-info">
        <div className="skeleton-line shimmer" style={{ width: '75%' }} />
        <div className="skeleton-line shimmer" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
