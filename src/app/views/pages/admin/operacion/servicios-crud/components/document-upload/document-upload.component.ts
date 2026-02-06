import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {
  @Input() label: string = '';
  @Input() hasFile: boolean = false;
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() view = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileSelected.emit(file);
      // Reset input value to allow selecting the same file again if needed (though usually not needed if we replace it)
      event.target.value = ''; 
    }
  }

  triggerUpload(fileInput: HTMLInputElement) {
    fileInput.click();
  }
}
