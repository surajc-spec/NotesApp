const mongoose = require('mongoose')


const questionPapersSchema = mongoose.Schema({
    title: { 
        type: String, required: [ true,"Title is required"], trim:true 
    },
    subject: {
         type: String, required: [ true,"Subject is required"], trim: true 
    },
    subjectCode: {
        type: String,
        required: [ true,"Subject Code is required"],
        uppercase: true,
        trim: true,
    },
    description: { 
        type: String, default: "" , trim:true
    },
    branch: { 
        type: String, required:[ true,"Branch is required"], trim:true 
    },
    year: { 
        type: String, required: [ true,"Year is required"], trim:true 
    },
    semester: {
        type: Number,
        required: [true, "Semester is required"],
        min: [1, "Semester must be at least 1"],
        max: [8, "Semester cannot be greater than 8"],
    },
        pdfKey: {
         type: String,
        required: [true, "PDF key is required"],
        trim: true,
    },
    examType:{ 
        type:String,
        required: [true, "Exam type is required"],
        enum: ["insem", "endsem"],
        }

    },{
    timestamps: true
})
questionPapersSchema.index({
  branch: 1,
  year: 1,
  semester: 1,
  subjectCode: 1,
  examType:1,
  createdAt: -1
});


const questionPapersModel = mongoose.model("QuestionPaper",questionPapersSchema)
module.exports = questionPapersModel;
