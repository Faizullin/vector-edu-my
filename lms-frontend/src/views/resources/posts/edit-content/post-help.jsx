import { Card } from 'react-bootstrap';

export default function PostHelp() {
  return (
    <Card className="p-3">
      <Card.Body>
        <Card.Title>Post Editing Help</Card.Title>
        <Card.Text>
          <ul>
            <li>Use the title field to name your post.</li>
            <li>Check the "Published" box to make the post public.</li>
            <li>Use the content editor to write your post.</li>
            <li>The author notes section is for internal documentation.</li>
            <li>Click "Save" to store changes.</li>
          </ul>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}