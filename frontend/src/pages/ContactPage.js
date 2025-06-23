import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['thisistejeswar@gmail.com'],
      color: 'primary'
    },
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+91-6305324406'],
      color: 'success'
    },
    {
      icon: MapPinIcon,
      title: 'Location',
      details: ['Nellore, Andhra Pradesh, India'],
      color: 'warning'
    },
    {
      icon: ClockIcon,
      title: 'Availability',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'],
      color: 'info'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - ShopNellore</title>
        <meta name="description" content="Contact ShopNellore for support, questions, or feedback. Our team is here to help you 24/7!" />
        <link rel="canonical" href="https://shopnellore.com/contact" />
        <meta property="og:title" content="Contact Us - ShopNellore" />
        <meta property="og:description" content="Contact ShopNellore for support, questions, or feedback. Our team is here to help you 24/7!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopnellore.com/contact" />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - ShopNellore" />
        <meta name="twitter:description" content="Contact ShopNellore for support, questions, or feedback. Our team is here to help you 24/7!" />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div>
        {/* Hero Section */}
        <section className="hero-gradient">
          <Container>
            <Row className="text-center">
              <Col lg={8} className="mx-auto">
                <h1 className="display-4 fw-bold mb-4">
                  Contact <span className="text-warning">Tejeswar Somarajupalli</span>
                </h1>
                <p className="lead mb-0">
                  Reach out for collaboration, project opportunities, or just to say hello!
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Contact Content */}
        <section className="py-5 bg-white">
          <Container>
            <Row className="g-5">
              {/* Contact Form */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                        <ChatBubbleLeftRightIcon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                      </div>
                      <div>
                        <h3 className="fw-bold mb-1">Send a Message</h3>
                        <p className="text-muted mb-0">I'll get back to you as soon as possible</p>
                      </div>
                    </div>

                    {submitStatus === 'success' && (
                      <Alert variant="success" className="mb-4">
                        <strong>Thank you!</strong> Your message has been sent successfully. I'll get back to you soon.
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter your full name"
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter your email address"
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Subject *</Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="What is this about?"
                          className="py-2"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          placeholder="Tell me more about your inquiry..."
                          className="py-2"
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100 fw-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="loading-spinner me-2"></span>
                            Sending Message...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              {/* Contact Information */}
              <Col lg={5}>
                <div className="mb-5">
                  <h3 className="fw-bold mb-4">Contact Information</h3>
                  <p className="text-muted mb-4">
                    I'm available for freelance, full-time, or collaborative opportunities. Let's connect!
                  </p>
                </div>

                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="border-0 shadow-sm mb-3">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start">
                          <div className={`bg-${info.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            <info.icon style={{ width: '24px', height: '24px', color: `var(--${info.color}-color)` }} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-2">{info.title}</h6>
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-muted mb-1 small">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="py-5 bg-light">
          <Container>
            <Row className="mb-5">
              <Col className="text-center">
                <h2 className="display-6 fw-bold mb-4">Frequently Asked Questions</h2>
                <p className="lead text-muted">
                  Find quick answers to common questions about our services.
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={8} className="mx-auto">
                <div className="accordion" id="faqAccordion">
                  {[
                    {
                      question: "How can I track my order?",
                      answer: "You can track your order by logging into your account and visiting the 'My Orders' section, or by using the tracking number sent to your email."
                    },
                    {
                      question: "What is your return policy?",
                      answer: "We offer a 30-day return policy for most items. Products must be in original condition with all packaging intact. Some items may have different return terms."
                    },
                    {
                      question: "Do you ship internationally?",
                      answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can check shipping options during checkout."
                    },
                    {
                      question: "How can I change or cancel my order?",
                      answer: "Orders can be modified or cancelled within 1 hour of placement. Please contact our customer service team immediately for assistance."
                    },
                    {
                      question: "What payment methods do you accept?",
                      answer: "We accept all major credit cards, debit cards, PayPal, and digital wallets. All payments are processed securely through our payment partners."
                    }
                  ].map((faq, index) => (
                    <Card key={index} className="mb-3 border-0 shadow-sm">
                      <Card.Header className="bg-white border-0">
                        <button
                          className="btn btn-link text-decoration-none w-100 text-start fw-semibold"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faq${index}`}
                          aria-expanded="false"
                          aria-controls={`faq${index}`}
                        >
                          {faq.question}
                        </button>
                      </Card.Header>
                      <div id={`faq${index}`} className="collapse" data-bs-parent="#faqAccordion">
                        <Card.Body className="text-muted">
                          {faq.answer}
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Call to Action */}
        <section className="py-5 bg-primary text-white">
          <Container>
            <Row className="text-center">
              <Col>
                <h2 className="display-6 fw-bold mb-3">Still Have Questions?</h2>
                <p className="lead mb-4">
                  Our customer support team is available 24/7 to help you with any questions or concerns.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button variant="warning" size="lg" className="fw-semibold">
                    <PhoneIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                    Call Now
                  </Button>
                  <Button variant="outline-light" size="lg" className="fw-semibold">
                    <EnvelopeIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                    Email Us
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default ContactPage; 