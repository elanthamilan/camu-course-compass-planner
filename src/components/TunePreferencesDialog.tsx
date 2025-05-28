import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Col } from 'react-bootstrap'; // Removed Row as it's not strictly needed for this layout
import { useSchedule } from '@/contexts/ScheduleContext';
import { TimePreference } from '@/lib/types';

interface TunePreferencesDialogProps {
  show: boolean; // Changed from 'open'
  onHide: () => void; // Changed from 'onOpenChange'
}

const TunePreferencesDialog: React.FC<TunePreferencesDialogProps> = ({ show, onHide }) => {
  const { schedulePreferences, updateSchedulePreferences } = useSchedule();
  
  const [localTimePreference, setLocalTimePreference] = useState<TimePreference>(schedulePreferences.timePreference);
  const [localAvoidFriday, setLocalAvoidFriday] = useState<boolean>(schedulePreferences.avoidFridayClasses);

  useEffect(() => {
    if (show) {
      setLocalTimePreference(schedulePreferences.timePreference);
      setLocalAvoidFriday(schedulePreferences.avoidFridayClasses);
    }
  }, [show, schedulePreferences]);

  const handleSave = () => {
    updateSchedulePreferences({
      timePreference: localTimePreference,
      avoidFridayClasses: localAvoidFriday,
    });
    onHide(); // Close dialog
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tune Schedule Preferences</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">Adjust your preferences to help generate a schedule that works for you.</p>
        <Form>
          {/* Time Preference Section */}
          <Form.Group className="mb-3">
            <Form.Label as="legend" column sm={12} className="font-semibold ps-0"> {/* ps-0 to align with checkbox group */}
              Time Preference
            </Form.Label>
            <Col sm={{ span: 12 }}> {/* Making radio options full width for clarity */}
              <Form.Check
                type="radio"
                label="No preference"
                id="time-none"
                value="none"
                name="timePreferenceRadio"
                checked={localTimePreference === 'none'}
                onChange={(e) => setLocalTimePreference(e.target.value as TimePreference)}
              />
              <Form.Check
                type="radio"
                label="Prefer morning classes (until 12 PM)"
                id="time-morning"
                value="morning"
                name="timePreferenceRadio"
                checked={localTimePreference === 'morning'}
                onChange={(e) => setLocalTimePreference(e.target.value as TimePreference)}
              />
              <Form.Check
                type="radio"
                label="Prefer afternoon classes (12 PM - 5 PM)"
                id="time-afternoon"
                value="afternoon"
                name="timePreferenceRadio"
                checked={localTimePreference === 'afternoon'}
                onChange={(e) => setLocalTimePreference(e.target.value as TimePreference)}
              />
              <Form.Check
                type="radio"
                label="Prefer evening classes (after 5 PM)"
                id="time-evening"
                value="evening"
                name="timePreferenceRadio"
                checked={localTimePreference === 'evening'}
                onChange={(e) => setLocalTimePreference(e.target.value as TimePreference)}
              />
            </Col>
          </Form.Group>

          {/* Day Preference Section */}
          <Form.Group className="mb-3">
            <Form.Label as="legend" column sm={12} className="font-semibold ps-0">
              Day Preferences
            </Form.Label>
            <Col sm={{ span: 12 }}>
              <Form.Check
                type="checkbox"
                label="Avoid Friday classes if possible"
                id="avoid-friday"
                checked={localAvoidFriday}
                onChange={(e) => setLocalAvoidFriday(e.target.checked)}
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Preferences
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TunePreferencesDialog;
