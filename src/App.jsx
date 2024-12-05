import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Modal, Button, Card } from 'react-bootstrap';
import './App.css';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { doc, addDoc, collection, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function App() {
  const [show, setShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [addDocument, setAddDocument] = useState('');
  const [fetchData, setFetchData] = useState([]);
  const [editContent, setEditContent] = useState('');
  const [editId, setEditId] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleEditClose = () => setEditShow(false);
  const handleEditShow = (data) => {
    setEditContent(data.paragraph || '');  
    setEditId(data.id);
    setEditShow(true);
  };

  const dbref = collection(db, 'DocApp');

  const handleAdd = async () => {
    const addData = await addDoc(dbref, { title: addDocument, paragraph: '' });
    if (addData) {
      alert("Data added successfully");
      fetch();
      setAddDocument("")
      handleClose();
    } else {
      alert("Error occurred!");
    }
  };

  const fetch = async () => {
    const fetchItem = await getDocs(dbref);
    const fetchDatas = fetchItem.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFetchData(fetchDatas);
    console.log(fetchDatas);
  };

  useEffect(() => {
    fetch();
  }, []);

  const delDoc = async (id) => {
    const delref = doc(dbref, id);
    try {
      await deleteDoc(delref);
      alert("Deleted successfully!");
      fetch(); // Fetch data again to update the UI
    } catch (err) {
      alert(err);
    }
  };

  const handleSave = async () => {
    if (!editId) return;
    const editRef = doc(dbref, editId);
    try {
      await updateDoc(editRef, { paragraph: editContent });
      alert("Document updated successfully!");
      setEditShow(false);
      fetch();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    
    <Router>
<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 mx-3 border-bottom">
        <h1 class="h2">Welcome to Docment App</h1>
        <button onClick={handleShow} class="btn btn-primary">Create New Document</button>
      </div>
      <main class="ms-sm-auto px-md-4">
      <div class="pt-3 pb-2 mb-3">
        <h1 class="text-center">My Documents</h1>
      </div>
    </main>
      <div className="container mt-5">
        <div className="row gap-4 justify-content-center">
          {fetchData.map((data) => (
            <Card key={data.id} style={{ width: '40rem' }}>
              <Card.Body> 
                <Card.Title className="fw-bolder">{data.title}</Card.Title>
                <hr />
                <Card.Text dangerouslySetInnerHTML={{ __html: data.paragraph }} />
                <div className='d-flex justify-content-end'>
                  <Button onClick={() => handleEditShow(data)} className="ms-2" variant="success">
                    EDIT <i className="fa-solid fa-edit"></i>
                  </Button>
                  <Button onClick={() => delDoc(data.id)} className="ms-4" variant="danger">
                    DELETE
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Document Modal */}
      <Modal centered show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">ADD YOUR DOCUMENT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form method="POST">
            <TextField
              onChange={(e) => setAddDocument(e.target.value)}
              value={addDocument}
              className="w-100"
              variant="outlined"
              label="ADD DOCUMENT TITLE"
              type="text"
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            ADD DOCUMENT
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Document Modal with React Quill */}
      <Modal centered show={editShow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">EDIT DOCUMENT PARAGRAPH</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactQuill theme="snow" value={editContent} onChange={setEditContent} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={handleSave}>
            UPDATE
          </Button>
        </Modal.Footer>
      </Modal>
    </Router>
  );
}

export default App;
