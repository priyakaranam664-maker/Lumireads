import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { generalAPI } from '../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await generalAPI.submitContact(data);
            toast.success('Message sent! We\'ll get back to you soon.');
            reset();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
        finally { setLoading(false); }
    };

    return (
        <>
            <Helmet><title>Contact Us - BookStore</title></Helmet>
            <div className="page-header"><Container><h1>Contact Us</h1><p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>We'd love to hear from you</p></Container></div>
            <Container className="py-4">
                <Row className="g-4">
                    <Col lg={4}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', height: '100%' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Get in Touch</h5>
                            {[
                                { icon: FiMapPin, title: 'Visit Us', info: '123 Book Street, Literary District, Mumbai, India - 400001' },
                                { icon: FiPhone, title: 'Call Us', info: '+91 98765 43210' },
                                { icon: FiMail, title: 'Email Us', info: 'support@bookstore.com' },
                            ].map(({ icon: Icon, title, info }) => (
                                <div key={title} className="d-flex gap-3 mb-4">
                                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h6 style={{ fontWeight: 700, marginBottom: '0.15rem', fontSize: '0.9rem' }}>{title}</h6>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>{info}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                    <Col lg={8}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Send a Message</h5>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Row className="g-3">
                                    <Col md={6}><label className="form-label">Name</label><input className="form-input" {...register('name', { required: 'Required' })} />{errors.name && <small style={{ color: 'var(--danger)' }}>{errors.name.message}</small>}</Col>
                                    <Col md={6}><label className="form-label">Email</label><input className="form-input" type="email" {...register('email', { required: 'Required' })} />{errors.email && <small style={{ color: 'var(--danger)' }}>{errors.email.message}</small>}</Col>
                                    <Col xs={12}><label className="form-label">Subject</label><input className="form-input" {...register('subject', { required: 'Required' })} />{errors.subject && <small style={{ color: 'var(--danger)' }}>{errors.subject.message}</small>}</Col>
                                    <Col xs={12}><label className="form-label">Message</label><textarea className="form-input" rows={5} {...register('message', { required: 'Required' })} />{errors.message && <small style={{ color: 'var(--danger)' }}>{errors.message.message}</small>}</Col>
                                    <Col xs={12}><button type="submit" className="btn-primary-custom" disabled={loading}><FiSend /> {loading ? 'Sending...' : 'Send Message'}</button></Col>
                                </Row>
                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Contact;
