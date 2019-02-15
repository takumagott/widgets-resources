// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import ReactNative from "react-native";
import ImagePickerLib from "react-native-image-picker";

type PictureSource = "camera" | "imageLibrary" | "either";

type PictureQuality = "original" | "low" | "medium" | "high" | "custom";

/**
 * @param {MxObject} picture - This field is required.
 * @param {"Actions.PictureSource.camera"|"Actions.PictureSource.imageLibrary"|"Actions.PictureSource.either"} pictureSource - Select a picture from the library or the camera. The default is to let the user decide.
 * @param {"Actions.PictureQuality.original"|"Actions.PictureQuality.low"|"Actions.PictureQuality.medium"|"Actions.PictureQuality.high"|"Actions.PictureQuality.custom"} pictureQuality - The default picture quality is 'Medium'.
 * @param {Big} maximumWidth - The picture will be scaled to this maximum pixel width, while maintaing the aspect ratio.
 * @param {Big} maximumHeight - The picture will be scaled to this maximum pixel height, while maintaing the aspect ratio.
 * @returns {boolean}
 */
function SelectPicture(
    picture?: mendix.lib.MxObject,
    pictureSource?: PictureSource,
    pictureQuality?: PictureQuality,
    maximumWidth?: BigJs.Big,
    maximumHeight?: BigJs.Big
): Promise<boolean> {
    // BEGIN USER CODE
    // Documentation https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md

    const ImagePicker: typeof ImagePickerLib = require("react-native-image-picker");

    if (!picture) {
        throw new TypeError("Input parameter 'Picture' is required");
    }

    if (!picture.inheritsFrom("System.FileDocument")) {
        const entity = picture.getEntity();
        throw new TypeError(`Entity ${entity} does not inherit from 'System.FileDocument'`);
    }

    if (pictureQuality === "custom" && !maximumHeight && !maximumWidth) {
        throw new TypeError("Picture quality is set to 'Custom', but no maximum width or height was provided");
    }

    return takePicture()
        .then(uri => {
            if (uri) {
                return storeFile(picture, uri);
            }
            return Promise.resolve(false);
        })
        .catch(error => {
            if (error !== "canceled") {
                throw new Error(error);
            }
            return Promise.resolve(false);
        });

    function takePicture(): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            const options = getOptions();
            const method = getPictureMethod();

            method(options, response => {
                if (response.didCancel) {
                    return resolve();
                }

                if (response.error) {
                    const unhandledError = handleImagePickerError(response.error);
                    if (!unhandledError) {
                        return resolve();
                    }
                    return reject(response.error);
                }

                return resolve(response.uri);
            });
        });
    }

    function storeFile(imageObject: mendix.lib.MxObject, uri: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(uri)
                .then(res => res.blob())
                .then(blob => {
                    const guid = imageObject.getGuid();
                    const filename = /[^\/]*$/.exec(uri)![0];

                    mx.data.saveDocument(guid, filename, {}, blob, onSuccess, onError);

                    function onSuccess(): void {
                        const Alert: typeof ReactNative.Alert = require("react-native").Alert;
                        Alert.alert("Success", filename);
                        resolve(true);
                    }

                    function onError(e: Error): void {
                        reject(e.message);
                    }
                })
                .catch(error => reject(error));
        });
    }

    // tslint:disable-next-line:typedef
    function getPictureMethod() {
        const source = pictureSource ? pictureSource : "either";

        switch (source) {
            case "imageLibrary":
                return ImagePicker.launchImageLibrary;
            case "camera":
                return ImagePicker.launchCamera;
            case "either":
            default:
                return ImagePicker.showImagePicker;
        }
    }

    // tslint:disable-next-line:typedef
    function getOptions() {
        const { maxWidth, maxHeight } = getPictureQuality();

        return {
            mediaType: "photo" as "photo",
            maxWidth,
            maxHeight,
            noData: true,
            permissionDenied: {
                title: `This app does not have access to your camera or photos`,
                text: "To enable access, tap Settings > Permissions and turn on Camera and Storage.",
                reTryTitle: "Settings",
                okTitle: "Cancel"
            }
        };
    }

    function getPictureQuality(): { maxWidth: number; maxHeight: number } {
        switch (pictureQuality) {
            case "low":
                return {
                    maxWidth: 1024,
                    maxHeight: 1024
                };
            case "medium":
            default:
                return {
                    maxWidth: 2048,
                    maxHeight: 2048
                };
            case "high":
                return {
                    maxWidth: 4096,
                    maxHeight: 4096
                };
            case "custom":
                return {
                    maxWidth: Number(maximumWidth),
                    maxHeight: Number(maximumHeight)
                };
        }
    }

    function handleImagePickerError(error: string): string | undefined {
        const ERRORS = {
            AndroidPermissionDenied: "Permissions weren't granted",
            iOSPhotoLibraryPermissionDenied: "Photo library permissions not granted",
            iOSCameraPermissionDenied: "Camera permissions not granted"
        };

        switch (error) {
            case ERRORS.iOSPhotoLibraryPermissionDenied:
                showiOSPermissionAlert(
                    "This app does not have access to your photos or videos",
                    "To enable access, tap Settings and turn on Photos."
                );
                return;

            case ERRORS.iOSCameraPermissionDenied:
                showiOSPermissionAlert(
                    "This app does not have access to your camera",
                    "To enable access, tap Settings and turn on Camera."
                );
                return;

            case ERRORS.AndroidPermissionDenied:
                // Ignore this error because the image picker plugin already shows an alert in this case.
                return;

            default:
                return error;
        }
    }

    function showiOSPermissionAlert(title: string, message: string): void {
        const Alert: typeof ReactNative.Alert = require("react-native").Alert;
        const Linking: typeof ReactNative.Linking = require("react-native").Linking;

        Alert.alert(
            title,
            message,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Settings", onPress: () => Linking.openURL("app-settings:") }
            ],
            { cancelable: false }
        );
    }

    // END USER CODE
}
