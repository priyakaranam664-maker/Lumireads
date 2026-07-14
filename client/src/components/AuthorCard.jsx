import { Link } from 'react-router-dom';
import { FiCheckCircle, FiStar, FiArrowRight, FiGlobe } from 'react-icons/fi';

const AuthorCard = ({ author }) => {
    const imageSrc = author.photoUrl || author.photo || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(author.name || 'author')}`;
    const bio = author.biography || author.description || '';
    const shortBio = bio.length > 120 ? `${bio.slice(0, 117)}...` : bio;
    const genreLabel = (author.genres || []).slice(0, 2).join(', ');

    return (
        <Link to={`/authors/${author.slug || author._id}`} className="author-card-link">
            <article className="author-card">
                <div className="author-card-thumb">
                    <img src={imageSrc} alt={author.name} loading="lazy" />
                    {author.isVerified && (
                        <span className="author-badge-author">
                            <FiCheckCircle size={14} /> Verified
                        </span>
                    )}
                </div>
                <div className="author-card-content">
                    <div className="author-card-title-group">
                        <h3>{author.name}</h3>
                        {author.nationality && (
                            <span className="author-card-subtitle"><FiGlobe size={14} /> {author.nationality}</span>
                        )}
                    </div>
                    <p className="author-card-excerpt">{shortBio || 'Author with an engaging catalog of books and stories.'}</p>
                    <div className="author-card-meta">
                        <span>{author.bookCount || author.totalBooks || 0} books</span>
                        <span>
                            <FiStar size={14} /> {(author.averageRating || 0).toFixed(1)}
                        </span>
                    </div>
                    {genreLabel && <div className="author-card-tags"><span className="tag">{genreLabel}</span></div>}
                    <div className="author-card-cta">
                        <span>View Profile</span>
                        <FiArrowRight size={16} />
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default AuthorCard;
