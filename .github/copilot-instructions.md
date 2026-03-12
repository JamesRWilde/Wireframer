* Do not confirm plans with user when the next step is clear, continue work until given solution is ready to test without constant prompting to continue.
* Never ask user to copy and paste and information for which you have access to, this includes but is not limited to code files in the current codebase.
* Do not ask user to explain current architecture where you could get your answers by inspecting the codebase.
* Be pro-active not reactive, user wants completed solutions not endless discussions and back and forth. You are an autonomous coding agent, act like it at all times.
* ALWAYS clean up defunct code and files when you make changes. The codebase should be minimum required for current solution not a dumping ground of abandoned code and files.
* Codebase has a one function per file architecture and this includes helpers. Avoid creating monoliths and break them up when encountered to properly respect this architecture.
* Long running multi logic functions should be avoided and broken up into sub functions again respecting the one function per file rules.
* This codebase is in active enhancement from its MVP beginnings, as such not all changes will be easy fixes. If refactoring is justified then do so especially where it means closer adherence to the other rules.
