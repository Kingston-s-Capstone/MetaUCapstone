import { useState } from "react";
import "./modal.css"

const AddOpportunityModal = ({ type, isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        organization: "",
        url: "",
        description: "",
        amount: "",
        deadline: "",
        date: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, type);
        onClose();
        setFormData({
            title: "",
            organization: "",
            url: "",
            description: "",
            amount: "",
            deadline: ""
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <h3>Add New {type[0].toUpperCase() + type.slice(1).toUpperCase()}</h3>
                <form onSubmit={handleSubmit} className="modalForm">
                    <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                    <input type="text" name="organization" placeholder="Organization" value={formData.organization} onChange={handleChange} required />
                    <input type="url" name="url" placeholder="URL" value={formData.url} onChange={handleChange}  required/>
                    {type === "scholarship" ? (
                        <>
                            <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            />
                            <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            />
                        </>
                        ) : (
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    )}
                    {type === "professional development" && (
                        <>
                        <h4>Date</h4>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                        </>
                    )}
                    <h4>Deadline</h4>
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
                    <button type="submit">Add</button>
                    <button type="button" className="cancel" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddOpportunityModal