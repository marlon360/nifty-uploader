import { NiftyUploader } from '../src/entry';
test("import NiftyUploader from entry", () => {

    const uploder = new NiftyUploader();
    expect(uploder !== undefined).toBeTruthy();

})