import { NextRequest, NextResponse } from 'next/server';
import { Paper } from '@/types/paper';

// For static export, we need to use force-static
export const dynamic = 'force-static';

// Sample papers for static export
const SAMPLE_PAPERS: Paper[] = [
  {
    title: "Quantum Computing Advances in Cryptographic Applications",
    abstract: `We present recent advances in quantum computing with applications to cryptography and security.\n\nOur research focuses on implementing Shor's algorithm for integer factorization and its implications for RSA cryptography. The results demonstrate that quantum computers with sufficient qubits and error correction capabilities pose a significant threat to widely deployed public-key cryptosystems.\n\nFurthermore, we explore quantum-resistant cryptographic primitives based on lattice problems and evaluate their performance on classical hardware.`,
    authors: ["David Miller", "Sarah Chen", "Robert Johnson"],
    authorText: "David Miller, Sarah Chen, Robert Johnson",
    published: "2023-04-04T09:15:30Z",
    updated: "2023-04-15T10:25:12Z",
    categories: ["quant-ph", "cs.ET", "cs.CR"],
    primaryCategory: "quant-ph",
    arxivId: "2304.01628v2",
    pdfUrl: "http://arxiv.org/pdf/2304.01628v2.pdf",
    relevanceScore: 9,
    relevanceTopic: "Quantum Cryptography"
  },
  {
    title: "Machine Learning Applications in Computer Vision: A Comprehensive Survey",
    abstract: `This paper provides a systematic review of machine learning techniques applied to computer vision problems, with emphasis on deep learning approaches.\n\nWe categorize and analyze over 500 research papers from 2018-2023, identifying trends, challenges, and breakthrough methodologies. The survey covers image classification, object detection, semantic segmentation, and instance segmentation tasks.\n\nOur meta-analysis reveals that transformer-based architectures are increasingly outperforming convolutional neural networks on diverse benchmarks. We also discuss computational efficiency considerations and recent advances in reducing the resource requirements of state-of-the-art vision models.`,
    authors: ["John Smith", "Jane Doe", "William Brown"],
    authorText: "John Smith, Jane Doe, William Brown",
    published: "2023-04-03T17:50:14Z",
    updated: "",
    categories: ["cs.LG", "cs.AI", "cs.CV"],
    primaryCategory: "cs.LG",
    arxivId: "2304.01626v3",
    pdfUrl: "http://arxiv.org/pdf/2304.01626v3.pdf",
    relevanceScore: 8,
    relevanceTopic: "Search Terms"
  },
  {
    title: "RF Spectrum Analysis Using Deep Learning Techniques",
    abstract: `We introduce a novel approach for radio frequency spectrum analysis using deep learning techniques.\n\nOur method combines convolutional neural networks with attention mechanisms to identify and classify signals in noisy RF environments. The proposed architecture achieves 97.8% accuracy on the RFML2023 dataset, outperforming traditional signal processing methods by a significant margin.\n\nWe demonstrate the system's effectiveness in real-world scenarios including cognitive radio applications, interference detection, and signal classification in dynamic spectrum access systems. Performance evaluations under varying signal-to-noise ratios show robust operation even in challenging conditions.`,
    authors: ["Michael Chen", "Laura Rodriguez"],
    authorText: "Michael Chen, Laura Rodriguez",
    published: "2023-05-12T14:30:22Z",
    updated: "2023-06-01T09:15:43Z",
    categories: ["eess.SP", "cs.LG", "physics.app-ph"],
    primaryCategory: "eess.SP",
    arxivId: "2305.04821v2",
    pdfUrl: "http://arxiv.org/pdf/2305.04821v2.pdf",
    relevanceScore: 10,
    relevanceTopic: "RF Analysis"
  },
  {
    title: "Secure Communication Protocols for IoT Devices",
    abstract: `This paper presents a comprehensive analysis of secure communication protocols suitable for resource-constrained IoT devices.\n\nWe evaluate the performance, security guarantees, and energy efficiency of lightweight cryptographic primitives including PRESENT, SIMON, SPECK, and ChaCha20-Poly1305. Our experimental results demonstrate that optimized implementations of these algorithms can provide adequate security while meeting the strict power and computational constraints of IoT endpoints.\n\nAdditionally, we propose a novel key management scheme that reduces the overhead of secure bootstrapping in large-scale IoT deployments without compromising security properties.`,
    authors: ["Sophia Wang", "James Peterson", "Aisha Patel"],
    authorText: "Sophia Wang, James Peterson, Aisha Patel",
    published: "2023-06-18T08:45:12Z",
    updated: "2023-07-02T14:20:30Z",
    categories: ["cs.CR", "cs.NI"],
    primaryCategory: "cs.CR",
    arxivId: "2306.09876v2",
    pdfUrl: "http://arxiv.org/pdf/2306.09876v2.pdf",
    relevanceScore: 8,
    relevanceTopic: "Classical Cryptography"
  }
];

// For static export, we'll return sample data
export function GET() {
  return NextResponse.json({ papers: SAMPLE_PAPERS });
} 