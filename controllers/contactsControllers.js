import Contact from "../models/contact.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 20, favorite } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };

        let filter = {};

        if (favorite === 'true') {
            filter.favorite = true;
        }

        const result = await Contact.paginate(filter, options);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findById(id);
        if (contact) {
            res.status(200).json(contact);
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (deletedContact) {
            res.status(200).json(deletedContact);
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createContact = async (req, res) => {
    try {
        const { error } = createContactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const { name, email, phone } = req.body;
        const newContact = new Contact({ name, email, phone });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = updateContactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });
        if (updatedContact) {
            res.status(200).json(updatedContact);
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateContactStatus = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { favorite } = req.body;

        const updatedContact = await Contact.findByIdAndUpdate(contactId, { favorite }, { new: true });

        if (updatedContact) {
            res.status(200).json(updatedContact);
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};