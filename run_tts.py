import argparse
import utils

def interactive_picker(options, title):
    if not options:
        return input(f"No options found. Enter {title} manually: ")
    print(f"\n--- Select {title} ---")
    for i, opt in enumerate(options, 1):
        print(f"{i}) {opt}")
    while True:
        choice = input(f"Choose a {title} (number) or type it manually: ")
        if choice.isdigit() and 1 <= int(choice) <= len(options):
            return options[int(choice)-1]
        return choice if choice.strip() else "Unknown"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["clone", "design"])
    parser.add_argument("--text")
    parser.add_argument("--lang")
    parser.add_argument("--out")
    parser.add_argument("--ref")
    parser.add_argument("--name")
    parser.add_argument("--instruct") 
    args = parser.parse_args()

    # 1. Mode selection
    if not args.mode:
        args.mode = interactive_picker(["clone", "design"], "Mode")
    
    # 2. Parameter Gathering
    jsonl_path = utils.JSONL_PATH
    if args.mode == "clone":
        if not args.name:
            names = utils.get_available_names(jsonl_path)
            args.name = interactive_picker(names, "Speaker Name")
        
        if not args.ref:
            labels = utils.get_available_labels_for_name(jsonl_path, args.name)
            args.ref = interactive_picker(labels, f"Label for {args.name}")
    else:
        if not args.instruct:
            args.instruct = input("\nEnter Voice Instruction: ")

    if not args.lang:
        args.lang = interactive_picker(utils.LANGUAGES, "Language")

    if not args.text:
        args.text = input("\nEnter the text to speak: ")

    # 3. Generation
    print("\n⏳ Generating audio...")
    if args.mode == "clone":
        out_path = utils.generate_clone(args.text, args.lang, args.name, args.ref, args.out, jsonl_path)
    else:
        model = utils.setup_tts_model(utils.DESIGN_MODEL_ID)
        results = list(model.generate_voice_design(
            text=args.text, 
            language=args.lang, 
            instruct=args.instruct
        ))
        if not results:
            print("\n❌ Error: Generation yielded no results.")
            return
        out_path = utils.save_audio(model, results, args.mode, args.name, args.lang, args.out)

    print(f"\n✨ Success! Saved compressed audio to: {out_path}")

if __name__ == "__main__":
    main()
