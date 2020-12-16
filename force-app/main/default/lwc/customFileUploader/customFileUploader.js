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
  @track uploadedFiles = [];
  flowProps = ["contentDocumentIDs", "uploadedFileNames", "recordId"];
  showStateHideUploader = false;

  loading = false;
  doomed = [];

  showStateModal = false; //used to hide/show dialog
  modalHeader = "Delete File"; //modal title
  modalContent = "Are you sure you want to delete this file?"; //modal message
  // name = "confirmModal"; //reference name of the component
  confirmLabel = "Delete"; //confirm button label
  cancelLabel = "Cancel"; //cancel button label
  // originalMessage; //any event/message/detail to be published back to the parent component
  handleClick(e) {
    const { name, value } = e.target;
    console.log("@value", value);
    console.log("@name", name);
    if (name === "delete") {
      this.doomed.push(value);
    } else if (name === "cancel") {
      this.doomed = [];
    } else if (name === "confirm") {
      this.handleDelete();
    }
    console.log("uploaded", this.uploadedFiles);
    console.log("doomed", this.doomed);
    // console.log("@handleClick", e);
    // console.log("e.target", e.target);
    // console.log("e.target.name", e.target.name);
    this.showStateModal = !this.showStateModal;
  }

  handleDelete() {
    //@TODO
    // show spinner
    // show notification(success/error)
    let cdIDs = this.doomed;
    this.loading = true;
    deleteDocuments({ cdIDs: cdIDs })
      .then((res) => {
        // console.log("res", res);
        if (res.success) {
          let file = this.uploadedFiles.filter((file) => {
            return file.documentId === cdIDs[0];
          })[0];
          // console.log("@res", file);
          this.uploadedFileNames = this.uploadedFileNames.filter((name) => {
            return name !== file.name;
          });
          // console.log("uFN", this.uploadedFileNames);
          this.contentDocumentIDs = this.contentDocumentIDs.filter((id) => {
            return id !== file.documentId;
          });
          // console.log("cDids", this.contentDocumentIDs);
          this.uploadedFiles = this.uploadedFiles.filter((f) => {
            return f.documentId !== file.documentId;
          });
          // console.log("uF", this.uploadedFiles);
          this.flowProps.forEach((prop) =>
            this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
          );
          // this.updateShowUploader();
          this.updateShowState();
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.doomed = [];
        this.loading = false;
      });
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

  get showStateLoading() {
    return this.loading;
  }

  get acceptedFormats() {
    return this.formats.split(",");
  }

  get showStateFilesUploaded() {
    return this.uploadedFiles.length > 0 && !this.loading;
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

  showStateUploader() {
    return this.multipleFiles || this.uploadedFiles.length > 0;
  }

  updateShowState() {
    if (this.showStateUploader()) {
      this.showStateHideUploader = false;
      return;
    }
    this.showStateHideUploader = true;
  }

  updateUploadedFiles(file) {
    file.ext = this.getExt(file.name.split(".")[1]);
    file.icon = "doctype:" + file.ext;
    this.uploadedFiles.push(file);
  }
}
