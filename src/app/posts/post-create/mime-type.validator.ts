import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";
//only accept image
export const mimeType = (control: AbstractControl) : Promise<{[key: string]: any}> | Observable<{[key: string]: any} | null> => {
    if (typeof(control.value) === 'string') {
        return of(null);
    }
    const file = control.value as File;
    const fileReader = new FileReader();
    const fileReaderObs = new Observable(
        (observer: Observer<{[key: string]: any} | null>) => {
          fileReader.addEventListener(
            'loadend',
            () => {
              // const arr = new Uint8Array(fileReader.result).subarray(0, 4); // <- this does not work
              // const arr = new Uint8Array(<ArrayBuffer>fileReader.result).subarray(0, 4); // <- This works
              const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4); // <- This works, too.
              let header ='';
              let isValid = false;
              for(let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16); //to hexidecimal string
              }
              switch (header) {
                case "89504e47":  // png file
                  isValid = true;
                  break;
                case "ffd8ffe0": // jpg files
                case "ffd8ffe1":
                case "ffd8ffe2":
                case "ffd8ffe3":
                case "ffd8ffe8":
                  isValid = true;
                  break;
                default:
                  isValid = false; // Or you can use the blob.type as fallback
                  break;
              }
              if(isValid) {
                observer.next(null);
              } else {
                observer.next({ invalidMimeType: true });
              }
              observer.complete();
            }
          );
          fileReader.readAsArrayBuffer(file);
        }
      );
      return fileReaderObs;
}