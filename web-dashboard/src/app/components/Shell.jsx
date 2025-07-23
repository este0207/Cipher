import Terminal from "./terminal";

export default function Shell() {
    return (
        <div className="ShellContainer">
            <p>Shell Output</p>
            <Terminal></Terminal>
            <input type="text" name="commande" id="commande" placeholder="Enter command here..."/>
        </div>
    );
}