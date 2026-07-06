import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiBookOpen, FiUsers, FiGlobe, FiAward } from 'react-icons/fi';

const About = () => (
    <>
        <Helmet><title>About Us - BookStore</title></Helmet>
        <div className="page-header"><Container><h1>About BookStore</h1><p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>Your premium destination for books</p></Container></div>
        <Container className="py-5">
            <Row className="align-items-center mb-5">
                <Col lg={6}>
                    <h2 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Our Story</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                        Founded in 2024, BookStore began with a simple vision: to make quality books accessible to everyone.
                        We believe that every book has the power to change a life, and our mission is to connect readers with
                        the stories, knowledge, and inspiration they seek.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                        Today, we serve thousands of book lovers across India, offering a curated selection of over 10,000 titles
                        across every genre imaginable. From bestselling fiction to groundbreaking non-fiction, academic textbooks
                        to children's literature, we have something for every reader.
                    </p>
                </Col>
                <Col lg={6}>
                    <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600" alt="Library"
                        style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }} />
                </Col>
            </Row>

            <Row className="g-4 mb-5">
                {[
                    { icon: FiBookOpen, num: '10,000+', label: 'Books Available', color: '#2563EB' },
                    { icon: FiUsers, num: '50,000+', label: 'Happy Readers', color: '#10B981' },
                    { icon: FiGlobe, num: '500+', label: 'Cities Served', color: '#F97316' },
                    { icon: FiAward, num: '99%', label: 'Customer Satisfaction', color: '#7C3AED' },
                ].map(({ icon: Icon, num, label, color }) => (
                    <Col xs={6} md={3} key={label}>
                        <div className="stat-card text-center">
                            <div className="stat-icon mx-auto mb-2" style={{ background: color }}><Icon size={22} /></div>
                            <div className="stat-value">{num}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', padding: '2.5rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Our Values</h3>
                <Row className="g-4 mt-2">
                    {[
                        { title: '📖 Quality Curation', desc: 'Every book in our collection is carefully selected to ensure the highest quality reading experience.' },
                        { title: '🚀 Fast Delivery', desc: 'We partner with the best logistics providers to ensure your books reach you quickly and safely.' },
                        { title: '💰 Best Prices', desc: 'We offer competitive prices and regular discounts to make reading affordable for everyone.' },
                        { title: '🤝 Customer First', desc: 'Our dedicated support team is always ready to help you with any questions or concerns.' },
                    ].map(({ title, desc }) => (
                        <Col md={6} key={title}>
                            <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h5>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{desc}</p>
                        </Col>
                    ))}
                </Row>
            </div>
        </Container>
    </>
);

export default About;
