export default function Shell() {
    return (
        <div className="ShellContainer">
            <p>Shell Output</p>
            <textarea name="Shell" id="Shell"></textarea>
            <input type="text" name="commande" id="commande" placeholder="Enter command here..."/>
        </div>
    );
}