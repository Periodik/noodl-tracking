import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.received_state || !body.portion_unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: parseFloat(body.portion_size) || 0,
        portion_unit: body.portion_unit,
        shelf_life_fresh: parseInt(body.shelf_life_fresh) || 0,
        shelf_life_thawed: parseInt(body.shelf_life_thawed) || 0,
        track_by_unit: Boolean(body.track_by_unit)
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: parseFloat(body.portion_size),
        portion_unit: body.portion_unit,
        shelf_life_fresh: parseInt(body.shelf_life_fresh),
        shelf_life_thawed: parseInt(body.shelf_life_thawed),
        track_by_unit: Boolean(body.track_by_unit)
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}