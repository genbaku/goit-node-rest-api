import * as contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await contactsService.listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactsService.getContactById(id);
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
        const deletedContact = await contactsService.removeContact(id);
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
            throw HttpError(400, error.message);
        }

        const { name, email, phone } = req.body;
        const newContact = await contactsService.addContact(name, email, phone);
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
            throw HttpError(400, error.message);
        }
        
        const updatedContact = await contactsService.updateContact(id, req.body);
        if (updatedContact) {
            res.status(200).json(updatedContact);
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
