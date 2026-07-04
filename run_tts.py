import argparse
import os
import numpy as np
import soundfile as sf
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
    jsonl_path = "my_dataset/train.jsonl"
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
        langs = ["English", "Chinese", "Japanese", "Korean", "German", "French", "Spanish", "Italian"]
        args.lang = interactive_picker(langs, "Language")

    if not args.text:
        args.text = input("\nEnter the text to speak: ")

    # 3. Model Selection
    model_id = (
        "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-8bit" if args.mode == "clone"
        else "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16"
    )
    model = utils.setup_tts_model(model_id)

    # 4. Generation
    print("\n⏳ Generating audio...")
    if args.mode == "clone":
        ref_entry = utils.load_reference_from_jsonl(jsonl_path, args.name, args.ref)
        audio_path = os.path.join("my_dataset", ref_entry["audio"])
        
        results = list(model.generate(
            text=args.text, 
            ref_audio=audio_path, 
            ref_text=ref_entry["text"], 
            language=args.lang
        ))
    else:
        results = list(model.generate_voice_design(
            text=args.text, 
            language=args.lang, 
            instruct=args.instruct
        ))

    # 5. Native Save as MP3 via Soundfile
    if results:
        out_param = args.out if (args.out and args.out.strip()) else None
        out_path = utils.get_unique_path("output", args.mode, args.name, args.lang, out_param, suffix=".mp3")
        
        audio_data = np.array(results[0].audio)
        sr = getattr(model, "sample_rate", 24000)
        
        # soundfile natively compresses the raw data arrays to MP3 on modern systems
        sf.write(str(out_path), audio_data, sr, format='MP3')
        print(f"\n✨ Success! Saved compressed audio to: {out_path}")
    else:
        print("\n❌ Error: Generation yielded no results.")

if __name__ == "__main__":
    main()
