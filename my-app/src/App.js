import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, Row, Col, Form, Button, Card, Spinner, 
  Alert, ListGroup, ProgressBar 
} from 'react-bootstrap';
import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  const fetchPolls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/polls");
      if (!res.ok) throw new Error("Failed to fetch polls");
      const data = await res.json();
      setPolls(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: options.filter(opt => opt.trim()) })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create poll");
      }
      setQuestion("");
      setOptions(["", ""]);
      fetchPolls();
    } catch (err) {
      setError(err.message);
    }
    setCreating(false);
  };

  const handleVote = async (pollId, optionIndex) => {
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/vote/${pollId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to vote");
      }
      fetchPolls();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (pollId) => {
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/polls/${pollId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete poll");
      }
      fetchPolls();
    } catch (err) {
      setError(err.message);
    }
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
  const updateOption = (idx, value) => setOptions(options.map((opt, i) => i === idx ? value : opt));

  return (
  <div className="app-background">
      <Container>
        {/* Project Title */}
        <div className="project-title">📊 Polling App</div>

        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8} lg={6}>
            <Card className="mb-4 shadow">
              <Card.Body>
                <h4 className="mb-4">Create Your Poll</h4>
                <Form onSubmit={handleCreatePoll}>
                  <Form.Group className="mb-3">
                    <Form.Label>Poll Question</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your poll question"
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Label>Options</Form.Label>
                  {options.map((opt, idx) => (
                    <Row key={idx} className="mb-2">
                      <Col xs={9}>
                        <Form.Control
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={e => updateOption(idx, e.target.value)}
                          required
                        />
                      </Col>
                      <Col xs={3} className="d-flex align-items-center">
                        {options.length > 2 && (
                          <Button variant="outline-danger" size="sm" onClick={() => removeOption(idx)}>
                            🗑️
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', marginBottom: '8px' }}>
                    <Button variant="secondary" type="button" onClick={addOption}>
                      ➕ Add Option
                    </Button>
                    <Button variant="primary" type="submit" disabled={creating}>
                      {creating ? <Spinner animation="border" size="sm" /> : "Create Poll"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {loading && <Spinner animation="border" className="d-block mx-auto" />}
            {error && <Alert variant="danger">{error}</Alert>}

            <h4 className="mb-3">All Polls</h4>
            {polls.length === 0 && !loading ? (
              <Alert variant="info">No polls available</Alert>
            ) : (
              polls.map((poll) => {
                const totalVotes = poll.votes.reduce((a, b) => a + b, 0) || 0;
                return (
                  <Card key={poll._id} className="mb-3 poll-card shadow-sm">
                    <Card.Body>
                      <Card.Title className="fw-bold">{poll.question}</Card.Title>
                      <ListGroup variant="flush" className="mb-2">
                        {poll.options.map((option, i) => (
                          <ListGroup.Item key={i}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{option}</span>
                              <Button variant="success" size="sm" onClick={() => handleVote(poll._id, i)}>
                                ✅ Vote
                              </Button>
                            </div>
                            <ProgressBar
                              now={totalVotes ? (poll.votes[i] / totalVotes) * 100 : 0}
                              label={`${poll.votes[i] || 0}`}
                              className="mt-2"
                            />
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(poll._id)}>
                        🗑 Delete Poll
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
