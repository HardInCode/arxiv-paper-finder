import { NextResponse } from 'next/server';

// Sample arXiv papers with formatted abstracts
const SAMPLE_PAPERS = [
  {
    title: "Quantum Computing Advances in Cryptographic Applications",
    abstract: `We present recent advances in quantum computing with applications to cryptography and security.\n\nOur research focuses on implementing Shor's algorithm for integer factorization and its implications for RSA cryptography. The results demonstrate that quantum computers with sufficient qubits and error correction capabilities pose a significant threat to widely deployed public-key cryptosystems.\n\nFurthermore, we explore quantum-resistant cryptographic primitives based on lattice problems and evaluate their performance on classical hardware.`,
    authors: ["David Miller", "Sarah Chen", "Robert Johnson"],
    published: "2023-04-04T09:15:30Z",
    updated: "2023-04-15T10:25:12Z",
    categories: ["quant-ph", "cs.ET", "cs.CR"],
    arxivId: "2304.01628v2"
  },
  {
    title: "Machine Learning Applications in Computer Vision: A Comprehensive Survey",
    abstract: `This paper provides a systematic review of machine learning techniques applied to computer vision problems, with emphasis on deep learning approaches.\n\nWe categorize and analyze over 500 research papers from 2018-2023, identifying trends, challenges, and breakthrough methodologies. The survey covers image classification, object detection, semantic segmentation, and instance segmentation tasks.\n\nOur meta-analysis reveals that transformer-based architectures are increasingly outperforming convolutional neural networks on diverse benchmarks. We also discuss computational efficiency considerations and recent advances in reducing the resource requirements of state-of-the-art vision models.`,
    authors: ["John Smith", "Jane Doe", "William Brown"],
    published: "2023-04-03T17:50:14Z",
    updated: "",
    categories: ["cs.LG", "cs.AI", "cs.CV"],
    arxivId: "2304.01626v3"
  },
  {
    title: "RF Spectrum Analysis Using Deep Learning Techniques",
    abstract: `We introduce a novel approach for radio frequency spectrum analysis using deep learning techniques.\n\nOur method combines convolutional neural networks with attention mechanisms to identify and classify signals in noisy RF environments. The proposed architecture achieves 97.8% accuracy on the RFML2023 dataset, outperforming traditional signal processing methods by a significant margin.\n\nWe demonstrate the system's effectiveness in real-world scenarios including cognitive radio applications, interference detection, and signal classification in dynamic spectrum access systems. Performance evaluations under varying signal-to-noise ratios show robust operation even in challenging conditions.`,
    authors: ["Michael Chen", "Laura Rodriguez"],
    published: "2023-05-12T14:30:22Z",
    updated: "2023-06-01T09:15:43Z",
    categories: ["eess.SP", "cs.LG", "physics.app-ph"],
    arxivId: "2305.04821v2"
  }
];

// Add PDF URLs and other fields
const papers = SAMPLE_PAPERS.map(paper => {
  return {
    ...paper,
    authorText: paper.authors.join(', '),
    pdfUrl: `http://arxiv.org/pdf/${paper.arxivId}.pdf`,
    primaryCategory: paper.categories[0],
    relevanceScore: Math.floor(Math.random() * 5) + 6, // Random score between 6-10
    relevanceTopic: "Sample Results"
  };
});

// For static export, we need to modify how we handle API routes
export const GET = async () => {
  return NextResponse.json({ papers }, { status: 200 });
}

// Add this for static export compatibility
export const dynamic = "force-static"; 