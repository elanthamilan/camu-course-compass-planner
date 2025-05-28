import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface AddSemesterDialogProps {
  show: boolean; // Changed from 'open'
  onHide: () => void; // Changed from 'onOpenChange'
  onAddSemester: (data: { year: string; semesterType: string }) => void;
}

const AddSemesterDialog: React.FC<AddSemesterDialogProps> = ({ show, onHide, onAddSemester }) => {
  const [year, setYear] = useState<string>(String(new Date().getFullYear())); // Default to current year
  const [semesterType, setSemesterType] = useState<string>('Fall'); // Default semester type

  const handleSubmit = () => {
    if (year && semesterType) {
      onAddSemester({ year, semesterType });
      onHide(); // Close dialog on submit
    } else {
      // Basic validation: alert or inline message (optional for this step)
      alert("Please fill in all fields.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Semester</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">Specify the academic year and type for the new semester.</p>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formAcademicYear">
            <Form.Label column sm="4" className="text-sm-end">
              Academic Year
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formSemesterType">
            <Form.Label column sm="4" className="text-sm-end">
              Semester Type
            </Form.Label>
            <Col sm="8">
              <Form.Check
                type="radio"
                label="Fall"
                value="Fall"
                id="fallRadio"
                name="semesterTypeRadio" // Name attribute to group radio buttons
                checked={semesterType === 'Fall'}
                onChange={(e) => setSemesterType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Spring"
                value="Spring"
                id="springRadio"
                name="semesterTypeRadio"
                checked={semesterType === 'Spring'}
                onChange={(e) => setSemesterType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Summer"
                value="Summer"
                id="summerRadio"
                name="semesterTypeRadio"
                checked={semesterType === 'Summer'}
                onChange={(e) => setSemesterType(e.target.value)}
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Semester
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSemesterDialog;
