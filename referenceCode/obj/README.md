# OBJ Import Instructions

1. Place your .obj file(s) in the `obj/input/` folder.
2. Run the import script from the root of the project:

    powershell -ExecutionPolicy Bypass -File obj/import-obj.ps1

3. The script will:
   - Generate new mesh files in `meshes/` (e.g., `meshes/yourfile.mesh.js`)
   - Add each mesh to `loader.js` so it is available in the app
   - Move each processed .obj file to `obj/processed/` so it won't be picked up again

You can now use your new shape(s) in the app like any other mesh.
