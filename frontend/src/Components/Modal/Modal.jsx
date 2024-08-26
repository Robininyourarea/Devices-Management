import React, { useState } from 'react';
import "./Modal.css";

const Modal = ({ closeModal, onSubmit, defaultValue }) => {

    // State
    const [formState, setFormState] = useState(
        defaultValue || {
            id: "",
            name: "",
            type: "",
            location: "",
            status: "working"
    });
    const [errors, setErrors] = useState("");


    // Validate field function
    const validateForm = () => {
        if (formState.id && formState.name && formState.type && formState.location && formState.status) {
            setErrors("");
            return true;
        } else {
            let errorFields = [];
            for (const [key, value] of Object.entries(formState)) {
                if (!value) {
                    errorFields.push(key);
                }
            }
            setErrors(errorFields.join(", "));
            return false;
        }
    };


    // handle filed change
    const handleChange = (e) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };


    // Submit form function
    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validateForm()) return;

        onSubmit(formState);

        // Reset form after submission
        setFormState({
            id: "",
            name: "",
            type: "",
            location: "",
            status: "working"
        });

        closeModal();
    };


    // user interface
    return (
        <div className='modal-container' 
             onClick={(e) => {
                if (e.target.className === "modal-container") closeModal();
             }}>
            <div className='modal'>
                <h2>Add New Device</h2>
                <form>
                    <div className='form-group'>
                        <label htmlFor="id">ID</label>
                        <input type="number" name="id" value = {formState.id} onChange={handleChange} readOnly={true}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" value = {formState.name} onChange={handleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="type">Type</label>
                        <input type="text" name="type" value = {formState.type} onChange={handleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="location">Location</label>
                        <input type="text" name="location" value = {formState.location} onChange={handleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="status">Status</label>
                        <select type="text" name="status" value = {formState.status} onChange={handleChange}>
                            <option value = "working">working</option>
                            <option value = "stopped">stopped</option>
                        </select>
                    </div>
                    {errors && <div className='error'>{`Please include: ${errors}`}</div>}
                    <button type="submit" className='btn' onClick={handleSubmit}>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Modal;