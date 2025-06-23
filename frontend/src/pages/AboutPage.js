import React from 'react';
import { Container, Row, Col, Card, Badge, Image } from 'react-bootstrap';
import { AcademicCapIcon, GlobeAltIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  // Resume details
  const skills = [
    'Java', 'Python', 'JavaScript', 'ReactJS', 'Node.js', 'Express.js', 'MongoDB', 'MySQL', 'sqlite3', 'HTML', 'CSS', 'JSON', 'Pandas', 'Scikit-Learn', 'Git', 'NLP', 'OOPS', 'Matlab'
  ];

  const education = [
    {
      degree: 'B.Tech in Computer Science and Engineering',
      institution: 'Indian Institute of Information Technology, Sri City',
      period: 'Expected 2025',
      description: 'CGPA: 8.64/10. Coursework: OOP, Data Structures & Algorithms, DBMS, Full Stack Development, Computer Networks, OS, Virtual Reality.'
    },
    {
      degree: 'Class XII',
      institution: 'Narayana Junior College, Aravindh Nagar, Nellore',
      period: '2021',
      description: 'Percentage: 98.9%'
    }
  ];

  const projects = [
    {
      title: 'Frame Your Memories',
      description: 'Onsite website for event customers (Weddings, Birthdays, Anniversaries, Farewells). Three user types: Customers, Business Man, Admin. Built with ReactJS, Node.js, Express.js, MongoDB, RESTful APIs, Redux, Git.',
      link: '#',
    },
    {
      title: 'Military Base Management System',
      description: 'Military Logistics Management System for Department of Defence. Manages and visualizes military assets. Built with mySQL, OOPS concepts, Java.',
      link: '#',
    },
    {
      title: 'Spell Correction in Telugu Language using NLP',
      description: 'Corrects spelling mistakes in Telugu using NLP (Python, HTML, CSS, NLTK). User-friendly web interface, uses NLTK for analysis.',
      link: '#',
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - ShopNellore</title>
        <meta name="description" content="Learn more about ShopNellore, our mission, values, and commitment to providing the best online shopping experience." />
        <link rel="canonical" href="https://shopnellore.com/about" />
        <meta property="og:title" content="About Us - ShopNellore" />
        <meta property="og:description" content="Learn more about ShopNellore, our mission, values, and commitment to providing the best online shopping experience." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopnellore.com/about" />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us - ShopNellore" />
        <meta name="twitter:description" content="Learn more about ShopNellore, our mission, values, and commitment to providing the best online shopping experience." />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
    <div>
      {/* Hero Section */}
      <section className="hero-gradient">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4">
                Tejeswar <span className="text-warning">Somarajupalli</span>
              </h1>
              <p className="lead mb-4">
                B.Tech in Computer Science and Engineering<br/>
                Indian Institute of Information Technology, Sri City<br/>
                Undergraduate - Final Year
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <div className="text-center">
                  <div className="fs-2 fw-bold text-warning">8.64</div>
                  <div className="text-light">CGPA</div>
                </div>
                <div className="text-center">
                  <div className="fs-2 fw-bold text-warning">2025</div>
                  <div className="text-light">Expected Graduation</div>
                </div>
                <div className="text-center">
                  <div className="fs-2 fw-bold text-warning">+150</div>
                  <div className="text-light">LeetCode Problems</div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="text-center mt-5 mt-lg-0">
                <Image src="/profile.jpg" alt="ShopNellore founder profile" roundedCircle className="mb-3" style={{ width: 120, height: 120, objectFit: 'cover' }} />
              <h3 className="text-white mt-4 mb-2">Aspiring Software Engineer</h3>
              <p className="text-light mb-0">
                Passionate about building scalable web applications and solving real-world problems with code.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Education Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-6 fw-bold mb-4">Education</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={8} className="mx-auto">
              {education.map((edu, index) => (
                <Card key={index} className="mb-4 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                        <AcademicCapIcon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{edu.degree}</h5>
                        <p className="text-primary mb-2">{edu.institution}</p>
                        <span className="badge bg-secondary mb-2">{edu.period}</span>
                        <p className="text-muted mb-0">{edu.description}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Skills Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-6 fw-bold mb-4">Technical Skills & Interests</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={10} className="mx-auto">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {skills.map((skill, index) => (
                  <Badge key={index} bg="primary" className="fs-6 px-3 py-2">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Projects Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-6 fw-bold mb-4">Personal Projects</h2>
            </Col>
          </Row>
          <Row>
            {projects.map((proj, idx) => (
              <Col md={4} key={idx} className="mb-4">
                <Card className="h-100 border-0 shadow-sm text-center">
                  <Card.Body className="p-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <CodeBracketIcon style={{ width: '32px', height: '32px', color: 'var(--primary-color)' }} />
                    </div>
                    <h5 className="fw-bold mb-3">{proj.title}</h5>
                    <p className="text-muted mb-0">{proj.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Achievements Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-6 fw-bold mb-4">Achievements & Certifications</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={8} className="mx-auto">
              <ul className="list-group list-group-flush fs-5">
                <li className="list-group-item">Successfully solved <strong>150+</strong> problems on Leetcode (LeetCode).</li>
                <li className="list-group-item">Solved around <strong>140+</strong> problems on GeeksforGeeks in Java (Profile).</li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Info */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="display-6 fw-bold mb-3">Contact</h2>
              <p className="lead mb-4">
                <span className="d-block mb-2">Email: thisistejeswar@gmail.com</span>
                <span className="d-block mb-2">Phone: +91-6305324406</span>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button className="btn btn-outline-primary btn-sm">
                    <GlobeAltIcon style={{ width: '16px', height: '16px' }} className="me-1" />
                    Portfolio
                  </button>
                  <button className="btn btn-outline-primary btn-sm">
                    <GlobeAltIcon style={{ width: '16px', height: '16px' }} className="me-1" />
                    LinkedIn
                  </button>
                </div>
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
    </>
  );
};

export default AboutPage; 