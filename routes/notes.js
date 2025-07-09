const express = require("express");
const fetchuser = require("../midddleware/fetchuser");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


//Route 1 : Fetch All Notes using : Get '/api/notes/fetchallnotes' . require login
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(errors.message);
    res.status(500).send("some bbb internal server error occured");
  }
});

//Route 2 : Add a New Note using : post '/api/notes/addnote' . require login
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Min. length for description is 6").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    console.log('in the async')
    try {
      const { title, description, tag } = req.body;
      // If there are error , return bad request and error.
      const errors = validationResult(req);
      console.log('ffffffffffffff')
      if (!errors.isEmpty()) {
        console.log('in if block')
        return res.status(400).json({success:false, errors: errors.array() });
      } else{
        console.log('in else block')
        // Strip HTML tags to get actual text length
        const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

        const cleanDescription = DOMPurify.sanitize(description);
const plainText = stripHtml(cleanDescription);

  if (plainText.length > 10000) {
  return res.status(400).json({ error: "Note is too long." });
}

        const note = new Note({
          title,
          description: cleanDescription,
          tag,
          user: req.user.id,
        });
        const saveNote = await note.save();
        res.json({success: true , note:saveNote});
      }

    } catch (error) {
      console.log('error occured in /addNote route: ',error);
      res.status(500).send("some internal server error occured");
    }
  }
);

//Route 3 : Update Note using : put '/api/notes/update' . require login
router.put("/update/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const cleanDescription = DOMPurify.sanitize(description);
    // Create a newNote Object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (cleanDescription) {
      newNote.description = cleanDescription;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // Find a note and Update it.
    console.log('Before finding the note')
    let note = await Note.findById(req.params.id);
    console.log('After finding the note')
    if (!note) {
      return res.status(404).send("Note does not Exist");
    }
    //Alow Updation only if the user owns this note
    if (note.user.toString() !== req.user.id) {
      console.log('In the if block')
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some bbb internal server error occured");
  }
});

//Route 4 : Delete Note using : DELETE '/api/notes/deletenote' . require login
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find a note and Delete it.
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note does not Exist");
    }
    //Alow Deletion only if the user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been Deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some bbb internal server error occured");
  }
});
module.exports = router;
