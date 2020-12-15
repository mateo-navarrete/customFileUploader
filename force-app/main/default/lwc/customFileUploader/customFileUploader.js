import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";
// import deleteDocuments from "@salesforce/apex/uploadController.deleteDocuments";

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
  @track uploadedFiles = [];
  flowProps = ["contentDocumentIDs", "uploadedFileNames", "recordId"];
  inactive = false;

  visible = true; //used to hide/show dialog
  titleLabel = "Confirmation Title"; //modal title
  name = "confirmModal"; //reference name of the component
  message = "Are you sure you want to delete this file?"; //modal message
  confirmLabel = "Delete"; //confirm button label
  cancelLabel = "Cancel"; //cancel button label
  originalMessage; //any event/message/detail to be published back to the parent component
  handleClick(e) {
    console.log("@handleClick", e);
    console.log("e.target", e.target);
    console.log("e.target.name", e.target.name);
    this.visible = !this.visible;
  }

  // handleRowAction = (e) => {
  //   console.log(JSON.stringify(e.detail));
  //   this.template
  //     .querySelector("[data-id=spinner]")
  //     .classList.remove("slds-hide");
  //   deleteDocuments({ docIds: [e.detail.row.Id] })
  //     .then((response) => {
  //       this.dispatchEvent(
  //         new ShowToastEvent({
  //           title: "Success",
  //           message: "Successfully deleted!",
  //           variant: "success"
  //         })
  //       );
  //       this.template
  //         .querySelector("[data-id=spinner]")
  //         .classList.add("slds-hide");
  //       this.template.querySelector("c-datatable[data-id=documents]").refresh();
  //     })
  //     .catch((error) => {
  //       this.dispatchEvent(
  //         new ShowToastEvent({
  //           title: "Error",
  //           message: error,
  //           variant: "error"
  //         })
  //       );
  //       this.template
  //         .querySelector("[data-id=spinner]")
  //         .classList.add("slds-hide");
  //     });
  // };

  // handleDelete(e) {
  //   if (e.target) {
  //     if (e.target.name === "openConfirmation") {
  //       //it can be set dynamically based on your logic
  //       this.originalMessage = e.currentTarget.dataset.id;
  //       //shows the component
  //       this.isDialogVisible = true;
  //     } else if (e.target.name === "confirmModal") {
  //       if (e.detail !== 1) {
  //         if (e.detail.status === "confirm") {
  //           //delete content document
  //           let contentDocumentId = e.detail.originalMessage;
  //           deleteRecord(contentDocumentId)
  //             .then(() => {
  //               this.dispatchEvent(
  //                 new ShowToastEvent({
  //                   title: "Success",
  //                   message: "File deleted",
  //                   variant: "success"
  //                 })
  //               );
  //               this.dispatchEvent(new CustomEvent("filedelete", {}));
  //             })
  //             .catch((error) => {
  //               this.dispatchEvent(
  //                 new ShowToastEvent({
  //                   title: "Error deleting file",
  //                   message: error.body.message,
  //                   variant: "error"
  //                 })
  //               );
  //             });
  //         }
  //       }

  //       //hides the component
  //       this.isDialogVisible = false;
  //     }
  //   }
  // }

  //handles button clicks
  // handleClick(e) {
  //   //creates object which will be published to the parent component
  //   if (e.target) {
  //     let finalEvent = {
  //       originalMessage: this.originalMessage,
  //       status: e.target.name
  //     };

  //     //dispatch a 'click' e so the parent component can handle it
  //     this.dispatchEvent(new CustomEvent("click", { detail: finalEvent }));
  //   }
  // }

  get acceptedFormats() {
    return this.formats.split(",");
  }

  get showStateFilesUploaded() {
    return this.uploadedFiles.length > 0;
  }

  getExt(ext) {
    let icons = ["csv", "pdf", "rtf", "txt", "zip"];
    let images = ["gif", "jpeg", "jpg", "png"];
    if (icons.includes(ext)) return ext;
    if (images.includes(ext)) return "image";
    return "attachment";
  }

  handleOnUploadFinished(e) {
    try {
      let files = e.detail.files;
      files.forEach((file) => {
        this.contentDocumentIDs.push(file.documentId);
        this.uploadedFileNames.push(file.name);
        this.updateUploadedFiles(file);
      });
      this.flowProps.forEach((prop) =>
        this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
      );
      this.updateShowState();
    } catch (err) {
      console.error(err);
    }
  }

  showStateActive() {
    return this.multipleFiles || !this.showStateFilesUploaded;
  }

  updateShowState() {
    if (this.showStateActive()) return;
    this.inactive = true;
  }

  updateUploadedFiles(file) {
    file.ext = this.getExt(file.name.split(".")[1]);
    file.icon = "doctype:" + file.ext;
    this.uploadedFiles.push(file);
  }
}
