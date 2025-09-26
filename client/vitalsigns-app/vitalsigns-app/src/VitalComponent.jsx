import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button, Form, Container, ListGroup, Alert } from 'react-bootstrap';

const GET_VITAL_SIGNS_QUERY = gql`
  query GetVitalSigns {
    vitalSigns {
      id
      type
      value
      unit
      timestamp
    }
  }
`;

const ADD_VITAL_SIGN_MUTATION = gql`
  mutation AddVitalSign($type: String!, $value: Float!, $unit: String!) {
    addVitalSign(type: $type, value: $value, unit: $unit) {
      id
      type
      value
      unit
      timestamp
    }
  }
`;

function VitalComponent() {
  const { loading, error, data } = useQuery(GET_VITAL_SIGNS_QUERY, {
    context: { credentials: 'include' },
  });

  const [addVitalSign, { loading: adding }] = useMutation(ADD_VITAL_SIGN_MUTATION, {
    refetchQueries: [GET_VITAL_SIGNS_QUERY],
  });

  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type.trim() || !value.trim() || !unit.trim()) return;
    await addVitalSign({ variables: { type, value: parseFloat(value), unit } });
    setType('');
    setValue('');
    setUnit('');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">Error :( Please make sure you're logged in.</Alert>;

  return (
    <Container>
      <h2>Record a Vital Sign</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter vital sign type (e.g., Heart Rate)"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Value</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Unit</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter unit (e.g., bpm)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={adding}>
          Add Vital Sign
        </Button>
      </Form>
      <h3 className="mt-4">Vital Signs List</h3>
      <ListGroup>
        {data && data.vitalSigns.map(({ id, type, value, unit, timestamp }) => (
          <ListGroup.Item key={id}>
            <strong>{type}</strong>: {value} {unit} (Recorded at: {new Date(Number(timestamp)).toLocaleString()})
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default VitalComponent;
