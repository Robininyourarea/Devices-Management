import React, { useEffect, useState } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from 'react-icons/bs';
import axios from 'axios';

import './Devices.css'

import Modal from '../Modal/Modal';

const Devices = () => {

  // define state
  const [devices, setDevices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null)
  const [defaultDevice, setDefaultDevice] = useState([]);

  // retrive token from localstorage
  const token = localStorage.getItem('token');

  // fetch devices data from database
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/devices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDevices();
  }, [token]);

  // Set row index that want to edit and open to popup
  const handleEditRow = (idx) => {
    console.log(idx);
    setRowToEdit(idx);
    setModalOpen(true);
  }


  // validate adding function
  const handleAddNewDevice = () => {
    // Calculate the next ID by finding the maximum ID and adding 1
    const nextId = devices.length > 0 ? Math.max(...devices.map(device => device.id)) + 1 : 1;
  
    // Open the modal and set the default value for the ID field
    setModalOpen(true);
    setRowToEdit(null);
    setDefaultDevice({
      id: nextId,
      name: "",
      type: "",
      location: "",
      status: "working",
    });
  };


  // submit function
  const handleSubmit = async (newDevice) => {
    // console.log(rowToEdit);
    try {

      // Adding
      if (rowToEdit === null) {
        // console.log('Add');
        // Make POST request to backend to add the new device
        const response = await axios.post('http://localhost:5000/devices', newDevice, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Update the frontend state with the newly added device
        setDevices([...devices, response.data]);
      } else {
        
        // Editing
        // console.log('edit');
        // Handle updating an existing device (this part remains the same)
        const updatedDevice = await axios.patch(`http://localhost:5000/devices/${newDevice.id}`, newDevice, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setDevices(devices.map((currDev, idx) => {
          if (idx !== rowToEdit) return currDev;
          return updatedDevice.data;
        }));
        setRowToEdit(null);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding or updating device:", error);
    }
  };


  // delete function
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devices.filter((device) => device.id !== id));
    } catch (error) {
      console.error(error);
    }
  };


  // user interface
  return (
    <div className="devices-container">

      <h1>Devices Management</h1>

      <button className="add-device-btn" onClick={handleAddNewDevice}>Add Device</button>
      
      <table className="devices-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device, idx) => (
            <tr key={idx}>
              <td>{device.id}</td>
              <td>{device.name}</td>
              <td>{device.type}</td>
              <td>{device.location}</td>
              <td><button className={`status ${device.status === 'working' ? 'status-working' : 'status-stopped'}`}>{device.status}</button></td>
              <td>
                <span className='actions'>
                  <BsFillPencilFill className='edit-icon' onClick={() => handleEditRow(idx)}/>
                  <BsFillTrashFill className='delete-icon' onClick={() => handleDelete(device.id)}/>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        
      </table>

      {
        modalOpen && 
        <Modal 
          closeModal={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          // defaultValue={ rowToEdit != null && devices[rowToEdit]}
          defaultValue={rowToEdit !== null ? devices[rowToEdit] : defaultDevice}
        />
      }
      
    </div>
  );
};

export default Devices;