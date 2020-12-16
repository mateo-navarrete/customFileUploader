import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";
import deleteDocuments from "@salesforce/apex/CustomFileUploaderController.deleteDocuments";

export default class CustomFileUploader extends LightningElement {
  @api contentDocumentIDs = [];
  @api flexipageRegionWidth;
  @api formats =
    ".csv, .doc, .docx, .gif, .jpeg, .jpg, .pdf, .png, .rtf, .txt, .word, .xls, .xlsx, .zip";
  @api label = "File Uploader";
  @api multipleFiles = false;
  @api recordId;
  @api title = "Upload files";
  @api uploadedFileNames = [];
  // testFile = {
  //   name: "testFile.pdf",
  //   icon: "doctype:pdf",
  //   documentId: "testdocid000",
  //   ext: "pdf"
  // };
  @track uploadedFiles = [];
  deactivateFileUploader = false;
  flowProps = ["contentDocumentIDs", "uploadedFileNames", "recordId"];
  showLoadingSpinner = false;
  showModal = false;
  toDelete = [];

  get acceptedFormats() {
    return this.formats.split(",");
  }

  get showUploadedFiles() {
    return this.uploadedFiles.length > 0;
  }

  getDeletedFile() {
    return this.uploadedFiles.filter((f) => {
      return f.documentId === this.toDelete[0];
    })[0];
  }

  getExt(ext) {
    let icons = ["csv", "pdf", "rtf", "txt", "zip"];
    let images = ["gif", "jpeg", "jpg", "png"];
    if (icons.includes(ext)) return ext;
    if (images.includes(ext)) return "image";
    return "attachment";
  }

  handleCancel() {
    this.toDelete = [];
  }

  handleClick(e) {
    const { name, value } = e.target;
    const method = "handle" + name.charAt(0).toUpperCase() + name.slice(1);
    // console.log(name, value);
    // console.log(method);
    // console.log(this[method]);
    if (this[method]) this[method](value);
    this.showModal = !this.showModal;
  }

  handleConfirm() {
    this.showLoadingSpinner = true;
    deleteDocuments({ cdIDs: this.toDelete })
      .then((res) => {
        if (res.success) {
          let file = this.getDeletedFile();
          this.updateContentDocumentIDs(file);
          this.updateUploadedFileNames(file);
          this.updateUploadedFiles(file);
          // this.contentDocumentIDs = this.updateContentDocumentIDs(file);
          // this.uploadedFileNames = this.updateUploadedFileNames(file);
          // this.uploadedFiles = this.updateUploadedFiles(file);
          this.toggleFileUploader();
          this.updateFlowProps();
        } else {
          throw new Error("Error deleting file.");
        }
      })
      .catch((e) => {
        console.error(e);
        // this.dispatchEvent(
        //   new ShowToastEvent({
        //     title: "Error",
        //     message: error,
        //     variant: "error"
        //   })
        // );
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  handleDelete(value) {
    this.toDelete.push(value);
  }

  handleOnUploadFinished(e) {
    try {
      let files = e.detail.files;
      files.forEach((file) => {
        let f = this.updateFile(file);
        console.log(
          this.contentDocumentIDs.length,
          this.uploadedFileNames.length,
          this.uploadedFiles.length,
          f
        );
        console.log(this.contentDocumentIDs, file.documentId);
        this.contentDocumentIDs.push(file.documentId);
        console.log(this.contentDocumentIDs, file.documentId);
        this.uploadedFileNames.push(file.name);
        this.uploadedFiles.push(f);
      });
      this.toggleFileUploader();
      this.updateFlowProps();
    } catch (err) {
      console.error(err);
      // this.dispatchEvent(
      //   new ShowToastEvent({
      //     title: "Error",
      //     message: error,
      //     variant: "error"
      //   })
      // );
    }
  }

  showFileUploader() {
    return this.multipleFiles || this.uploadedFiles.length < 1;
  }

  toggleFileUploader() {
    if (this.showFileUploader()) {
      this.deactivateFileUploader = false;
      return;
    }
    this.deactivateFileUploader = true;
  }

  updateContentDocumentIDs(file) {
    this.contentDocumentIDs = this.contentDocumentIDs.filter((id) => {
      return id !== file.documentId;
    });
    // return this.contentDocumentIDs.filter((id) => id !== file.documentId);
  }

  updateFile(file) {
    file.ext = this.getExt(file.name.split(".")[1]);
    file.icon = "doctype:" + file.ext;
    return file;
  }

  updateUploadedFileNames(file) {
    this.uploadedFileNames = this.uploadedFileNames.filter((name) => {
      return name !== file.name;
    });
    // return this.uploadedFileNames.filter((name) => name !== file.name);
  }

  updateUploadedFiles(file) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => {
      return f.documentId !== file.documentId;
    });
    // return this.uploadedFiles.filter((f) => f.documentId !== file.documentId);
  }

  updateFlowProps() {
    this.flowProps.forEach((prop) =>
      this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
    );
  }
}
